import { useDeleteMultipleRecordsAction } from '@/action-menu/actions/record-actions/multiple-records/hooks/useDeleteMultipleRecordsAction';
import { useExportMultipleRecordsAction } from '@/action-menu/actions/record-actions/multiple-records/hooks/useExportMultipleRecordsAction';
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
    objectMetadataItem,
  });

  const {
    registerExportMultipleRecordsAction,
    unregisterExportMultipleRecordsAction,
  } = useExportMultipleRecordsAction({
    objectMetadataItem,
  });

  const registerMultipleRecordsActions = () => {
    registerDeleteMultipleRecordsAction({ position: 0 });
    registerExportMultipleRecordsAction({ position: 1 });
  };

  const unregisterMultipleRecordsActions = () => {
    unregisterDeleteMultipleRecordsAction();
    unregisterExportMultipleRecordsAction();
  };

  return {
    registerMultipleRecordsActions,
    unregisterMultipleRecordsActions,
  };
};
