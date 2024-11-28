import { useMultipleRecordsActions } from '@/action-menu/actions/record-actions/multiple-records/hooks/useMultipleRecordsActions';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useEffect } from 'react';

export const MultipleRecordsActionMenuEntrySetterEffect = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { registerMultipleRecordsActions, unregisterMultipleRecordsActions } =
    useMultipleRecordsActions({
      objectMetadataItem,
    });

  useEffect(() => {
    registerMultipleRecordsActions();

    return () => {
      unregisterMultipleRecordsActions();
    };
  }, [registerMultipleRecordsActions, unregisterMultipleRecordsActions]);

  return null;
};
