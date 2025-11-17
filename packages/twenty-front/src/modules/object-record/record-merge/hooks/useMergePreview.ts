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
  const [lastPreviewId, setLastPreviewId] = useState<string>('');
  const [lastPreviewSignature, setLastPreviewSignature] = useState<string>('');
  // eslint-disable-next-line @nx/workspace-no-state-useref
  const currentRunIdRef = useRef(0);

  const mergeSettings = useRecoilValue(mergeSettingsState);
  const isMergeInProgress = useRecoilValue(isMergeInProgressState);

  const { mergeManyRecords } = useMergeManyRecords({
    objectNameSingular,
  });

  const commandMenuNavigationMorphItemsByPage = useRecoilValue(
    commandMenuNavigationMorphItemsByPageState,
  );

  const selectedRecordIds = useMemo(
    () =>
      commandMenuNavigationMorphItemsByPage
        .get(CommandMenuPages.MergeRecords)
        ?.map((morphItem) => morphItem.recordId) ?? [],
    [commandMenuNavigationMorphItemsByPage],
  );
  const selectedRecords = useRecoilValue(
    recordStoreRecordsSelector({
      recordIds: selectedRecordIds,
    }),
  );

  const setPreviewRecordById = useRecoilCallback(
    ({ set }) =>
      (record: ObjectRecord | null, previousId: string) => {
        if (previousId !== '') {
          set(mergePreviewRecordFamilyState(previousId), null);
        }
        if (record !== null) {
          set(mergePreviewRecordFamilyState(record.id), record);
        }
      },
    [],
  );

  const previewSignature = useMemo(
    () =>
      `${selectedRecordIds.join(',')}|${mergeSettings.conflictPriorityIndex}`,
    [selectedRecordIds, mergeSettings.conflictPriorityIndex],
  );

  useEffect(() => {
    const fetchPreview = async () => {
      if (selectedRecordIds.length < 2 || isMergeInProgress) {
        setMergePreviewRecord(null);
        setPreviewRecordById(null, lastPreviewId);
        setLastPreviewId('');
        return;
      }

      if (lastPreviewSignature === previewSignature) {
        return;
      }
      setLastPreviewSignature(previewSignature);

      currentRunIdRef.current += 1;
      const runId = currentRunIdRef.current;

      setIsGeneratingPreview(true);
      try {
        const previewRecord = await mergeManyRecords({
          recordIds: selectedRecordIds,
          mergeSettings,
          preview: true,
        });
        if (!previewRecord) {
          if (runId === currentRunIdRef.current) {
            setMergePreviewRecord(null);
            setPreviewRecordById(null, lastPreviewId);
            setLastPreviewId('');
          }
          return;
        }

        const transformPreviewRecord = getRecordFromRecordNode<ObjectRecord>({
          recordNode: previewRecord,
        });

        if (runId === currentRunIdRef.current) {
          setMergePreviewRecord(transformPreviewRecord);
          setPreviewRecordById(transformPreviewRecord, lastPreviewId);
          setLastPreviewId(transformPreviewRecord.id);
        }
      } catch {
        if (runId === currentRunIdRef.current) {
          setMergePreviewRecord(null);
          setPreviewRecordById(null, lastPreviewId);
          setLastPreviewId('');
        }
      } finally {
        if (runId === currentRunIdRef.current) {
          setIsGeneratingPreview(false);
        }
      }
    };

    if (selectedRecordIds.length > 0 && !isMergeInProgress) {
      fetchPreview();
    }
  }, [
    previewSignature,
    selectedRecordIds,
    isMergeInProgress,
    mergeManyRecords,
    mergeSettings,
    setPreviewRecordById,
    lastPreviewId,
    lastPreviewSignature,
  ]);

  return {
    selectedRecords,
    mergePreviewRecord,
    isGeneratingPreview: isGeneratingPreview,
  };
};
