// SOURCING: twentyhq/twenty RecordIndexListContainer (PR #23829) — fork-local RELATIONS container
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordRelations } from '@/object-record/record-relations/components/RecordRelations';
import { RecordRelationsSSESubscribeEffect } from '@/object-record/record-relations/components/RecordRelationsSSESubscribeEffect';
import { RecordRelationsContextProvider } from '@/object-record/record-relations/contexts/RecordRelationsContext';

type RecordIndexRelationsContainerProps = {
  recordRelationsInstanceId: string;
  viewBarInstanceId: string;
};

export const RecordIndexRelationsContainer = ({
  recordRelationsInstanceId,
  viewBarInstanceId,
}: RecordIndexRelationsContainerProps) => {
  const { objectNameSingular } = useRecordIndexContextOrThrow();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  return (
    <RecordComponentInstanceContextsWrapper
      componentInstanceId={recordRelationsInstanceId}
    >
      <RecordRelationsContextProvider
        value={{
          viewBarInstanceId,
          objectNameSingular,
          objectMetadataItem,
          objectPermissions,
        }}
      >
        <RecordRelations />
        <RecordRelationsSSESubscribeEffect />
      </RecordRelationsContextProvider>
    </RecordComponentInstanceContextsWrapper>
  );
};
