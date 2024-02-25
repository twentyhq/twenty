import { useEffect, useState } from 'react';
import { json2csv } from 'json-2-csv';
import { useRecoilValue } from 'recoil';

import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

import { useFindManyParams } from '../../hooks/useLoadRecordIndexTable';

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const download = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
};

type GenerateExportOptions = {
  columns: ColumnDefinition<FieldMetadata>[];
  rows: object[];
};

type GenerateExport = (data: GenerateExportOptions) => string;

export const generateCsv: GenerateExport = ({
  columns,
  rows,
}: GenerateExportOptions): string => {
  const keys = columns.flatMap((col) => {
    const column = {
      field: col.metadata.fieldName,
      title: col.label,
    };

    const objectColumnData = rows.find((r) => {
      const val = (r as any)[column.field];
      return val && typeof val === 'object' && !Array.isArray(val);
    });

    if (objectColumnData) {
      const nestedFieldsWithoutTypename = Object.keys(
        (objectColumnData as any)[column.field],
      )
        .filter((key) => key !== '__typename')
        .map((k) => ({
          field: `${column.field}.${k}`,
          title: `${column.title}${k[0].toUpperCase() + k.slice(1)}`,
        }));
      return nestedFieldsWithoutTypename;
    }
    return [column];
  });

  return json2csv(rows, {
    keys,
    emptyFieldValue: '',
  });
};

export const percentage = (part: number, whole: number): number => {
  return Math.round((part / whole) * 100);
};

const downloader = (mimeType: string, generator: GenerateExport) => {
  return (filename: string, data: GenerateExportOptions) => {
    const blob = new Blob([generator(data)], { type: mimeType });
    download(blob, filename);
  };
};

export const csvDownloader = downloader('text/csv', generateCsv);

type UseExportTableDataOptions = {
  delayMs: number;
  filename: string;
  maximumRequests?: number;
  objectNameSingular: string;
  pageSize?: number;
  recordIndexId: string;
};

export const useExportTableData = ({
  delayMs,
  filename,
  maximumRequests = 100,
  objectNameSingular,
  pageSize = 30,
  recordIndexId,
}: UseExportTableDataOptions) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [inflight, setInflight] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [hasNextPage, setHasNextPage] = useState(true);
  const { getVisibleTableColumnsSelector } =
    useRecordTableStates(recordIndexId);
  const columns = useRecoilValue(getVisibleTableColumnsSelector());
  const params = useFindManyParams(objectNameSingular);
  const { totalCount, records, fetchMoreRecords } = useFindManyRecords({
    ...params,
    limit: pageSize,
    onCompleted: (_data, { hasNextPage }) => {
      setHasNextPage(hasNextPage ?? false);
    },
  });

  useEffect(() => {
    const MAXIMUM_REQUESTS = Math.min(maximumRequests, totalCount / pageSize);

    const downloadCav = (rows: object[]) => {
      csvDownloader(filename, { rows, columns });
      setIsDownloading(false);
      setProgress(undefined);
    };

    const fetchNextPage = async () => {
      setInflight(true);
      await fetchMoreRecords();
      setPageCount((state) => state + 1);
      setProgress(percentage(pageCount, MAXIMUM_REQUESTS));
      await sleep(delayMs);
      setInflight(false);
    };

    if (!isDownloading || inflight) {
      return;
    }

    if (!hasNextPage || pageCount >= MAXIMUM_REQUESTS) {
      downloadCav(records);
    } else {
      fetchNextPage();
    }
  }, [
    delayMs,
    fetchMoreRecords,
    filename,
    hasNextPage,
    inflight,
    isDownloading,
    pageCount,
    records,
    totalCount,
    columns,
    maximumRequests,
    pageSize,
  ]);

  return { progress, download: () => setIsDownloading(true) };
};
