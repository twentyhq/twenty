import { type ReactNode } from 'react';

import { RecordShowPageShell } from '~/pages/object-record/RecordShowPageShell';
import { useRecordShowPage } from '@/object-record/record-show/hooks/useRecordShowPage';
import { useRecordShowPageResource } from '@/object-record/record-show/hooks/useRecordShowPageResource';
import { type RecordShowPageHeaderTitleMode } from '@/object-record/record-show/types/RecordShowPageHeaderTitleMode';

export type RecordShowPageParameters = {
  objectNameSingular?: string;
  objectRecordId?: string;
};

export const RecordShowPageContent = ({
  parameters,
  headerActions,
  headerTitlePrefix,
  headerTitleAccessory,
  headerTitleMode,
  isRecordIdentifierBarHidden,
}: {
  parameters: RecordShowPageParameters;
  headerActions?: ReactNode;
  headerTitlePrefix?: ReactNode;
  headerTitleAccessory?: ReactNode;
  headerTitleMode?: RecordShowPageHeaderTitleMode;
  isRecordIdentifierBarHidden?: boolean;
}) => {
  const { objectNameSingular, objectRecordId } = useRecordShowPage(
    parameters.objectNameSingular ?? '',
    parameters.objectRecordId ?? '',
  );

  const { error, loading, record } = useRecordShowPageResource({
    objectNameSingular,
    recordId: objectRecordId,
  });

  return (
    <RecordShowPageShell
      objectNameSingular={objectNameSingular}
      objectRecordId={objectRecordId}
      record={record}
      loading={loading}
      error={error}
      headerActions={headerActions}
      headerTitlePrefix={headerTitlePrefix}
      headerTitleAccessory={headerTitleAccessory}
      headerTitleMode={headerTitleMode}
      isRecordIdentifierBarHidden={isRecordIdentifierBarHidden}
    />
  );
};
