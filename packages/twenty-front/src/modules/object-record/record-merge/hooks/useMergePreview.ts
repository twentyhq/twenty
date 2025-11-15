import { commandMenuNavigationMorphItemsByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsByPageState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { useMergeManyRecords } from '@/object-record/hooks/useMergeManyRecords';
import { mergePreviewRecordFamilyState } from '@/object-record/record-merge/states/mergePreviewRecordFamilyState';
import { recordStoreRecordsSelector } from '@/object-record/record-store/states/selectors/recordStoreRecordsSelector';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { isMergeInProgressState } from '../states/mergeInProgressState';
import { mergeSettingsState } from '../states/mergeSettingsState';

type UseMergePreviewProps = {
  objectNameSingular: string;
};

export const useMergePreview = ({
  objectNameSingular,
}: UseMergePreviewProps) => {
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [mergePreviewRecord, setMergePreviewRecord] =
    useState<ObjectRecord | null>(null);

  const mergeSettings = useRecoilValue(mergeSettingsState);
  const isMergeInProgress = useRecoilValue(isMergeInProgressState);

  const { mergeManyRecords } = useMergeManyRecords({
    objectNameSingular,
  });

  const commandMenuNavigationMorphItemsByPage = useRecoilValue(
    commandMenuNavigationMorphItemsByPageState,
  );

  const selectedRecordIds =
    commandMenuNavigationMorphItemsByPage
      .get(CommandMenuPages.MergeRecords)
      ?.map((morphItem) => morphItem.recordId) ?? [];
  const idsSig = useMemo(
    () => selectedRecordIds.join(','),
    [selectedRecordIds],
  );
  const selectedRecords = useRecoilValue(
    recordStoreRecordsSelector({
      recordIds: selectedRecordIds,
    }),
  );

  const lastPreviewIdRef = useRef<string>('');
  const setPreviewRecordById = useRecoilCallback(
    ({ set }) =>
      (record: ObjectRecord | null) => {
        if (lastPreviewIdRef.current) {
          set(mergePreviewRecordFamilyState(lastPreviewIdRef.current), null);
        }
        if (record) {
          set(mergePreviewRecordFamilyState(record.id), record);
          lastPreviewIdRef.current = record.id;
        } else {
          lastPreviewIdRef.current = '';
        }
      },
    [],
  );

  const prioritySig = String(mergeSettings.conflictPriorityIndex);
  const fetchSig = `${idsSig}|${prioritySig}`;
  const lastSigRef = useRef<string>('');
  const runIdRef = useRef(0);

  useEffect(() => {
    const fetchPreview = async () => {
      if (selectedRecordIds.length < 2 || isMergeInProgress) {
        setMergePreviewRecord(null);
        setPreviewRecordById(null);
        return;
      }

      if (lastSigRef.current === fetchSig) {
        return;
      }
      lastSigRef.current = fetchSig;

      const currentRunId = ++runIdRef.current;

      setIsGeneratingPreview(true);
      try {
        const previewRecord = await mergeManyRecords({
          recordIds: selectedRecordIds,
          mergeSettings,
          preview: true,
        });
        if (!previewRecord) {
          if (currentRunId === runIdRef.current) {
            setMergePreviewRecord(null);
            setPreviewRecordById(null);
          }
          return;
        }

        const transformPreviewRecord = getRecordFromRecordNode<ObjectRecord>({
          recordNode: previewRecord,
        });

        if (currentRunId === runIdRef.current) {
          setMergePreviewRecord(transformPreviewRecord);
          setPreviewRecordById(transformPreviewRecord);
        }
      } catch {
        if (currentRunId === runIdRef.current) {
          setMergePreviewRecord(null);
          setPreviewRecordById(null);
        }
      } finally {
        if (currentRunId === runIdRef.current) {
          setIsGeneratingPreview(false);
        }
      }
    };

    if (selectedRecordIds.length > 0 && !isMergeInProgress) {
      fetchPreview();
    }
  }, [
    fetchSig,
    selectedRecordIds,
    isMergeInProgress,
    mergeManyRecords,
    mergeSettings,
    setPreviewRecordById,
  ]);

  return {
    selectedRecords,
    mergePreviewRecord,
    isGeneratingPreview: isGeneratingPreview,
  };
};
