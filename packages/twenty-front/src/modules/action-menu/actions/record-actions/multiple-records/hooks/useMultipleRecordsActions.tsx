import { useDeleteMultipleRecordsAction } from '@/action-menu/actions/record-actions/multiple-records/hooks/useDeleteMultipleRecordsAction';
import { useExportViewNoSelectionRecordAction } from '@/action-menu/actions/record-actions/no-selection/hooks/useExportMultipleRecordsAction';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const useMultipleRecordsActions = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const {
    registerDeleteMultipleRecordsAction,
    unregisterDeleteMultipleRecordsAction,
  } = useDeleteMultipleRecordsAction({
    position: 0,
    objectMetadataItem,
  });

  const {
    registerExportViewNoSelectionRecordsAction,
    unregisterExportViewNoSelectionRecordsAction,
  } = useExportViewNoSelectionRecordAction({
    position: 1,
    objectMetadataItem,
  });

  const registerMultipleRecordsActions = () => {
    registerDeleteMultipleRecordsAction();
    registerExportViewNoSelectionRecordsAction();
  };

  const unregisterMultipleRecordsActions = () => {
    unregisterDeleteMultipleRecordsAction();
    unregisterExportViewNoSelectionRecordsAction();
  };

  return {
    registerMultipleRecordsActions,
    unregisterMultipleRecordsActions,
  };
};
