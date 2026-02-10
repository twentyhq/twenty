import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';

import { UpdateMultipleRecordsContainer } from '@/object-record/record-update-multiple/components/UpdateMultipleRecordsContainer';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import styled from '@emotion/styled';

const StyledRightDrawerRecord = styled.div`
  height: 100%;
`;

export const CommandMenuUpdateMultipleRecords = () => {
  const commandMenuPageInstanceId = useComponentInstanceStateContext(
    CommandMenuPageComponentInstanceContext,
  )?.instanceId;

  if (!commandMenuPageInstanceId) {
    throw new Error('Command menu page instance id is not defined');
  }

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow(
    commandMenuPageInstanceId,
  );

  return (
    <StyledRightDrawerRecord>
      <UpdateMultipleRecordsContainer
        objectNameSingular={objectMetadataItem.nameSingular}
        contextStoreInstanceId={commandMenuPageInstanceId}
      />
    </StyledRightDrawerRecord>
  );
};
