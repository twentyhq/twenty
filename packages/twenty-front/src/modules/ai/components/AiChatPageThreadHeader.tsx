import { styled } from '@linaria/react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';

import { AiChatCloseButton } from '@/ai/components/AiChatCloseButton';
import { AiChatThreadRecordTargets } from '@/ai/components/AiChatThreadRecordTargets';
import { RecordShowCommandMenu } from '@/command-menu-item/components/RecordShowCommandMenu';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordShowContainerContextStoreTargetedRecordsEffect } from '@/object-record/record-show/components/RecordShowContainerContextStoreTargetedRecordsEffect';
import { RecordShowPageResourceEffect } from '@/object-record/record-show/components/RecordShowPageResourceEffect';
import { RecordShowPageSSESubscribeEffect } from '@/object-record/record-show/components/RecordShowPageSSESubscribeEffect';
import { useRecordIdentifierTitle } from '@/object-record/record-show/hooks/useRecordIdentifierTitle';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { computeRecordShowComponentInstanceId } from '@/object-record/record-show/utils/computeRecordShowComponentInstanceId';
import { RecordTitleCell } from '@/object-record/record-title-cell/components/RecordTitleCell';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledTitle = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledTitleCell = styled.div`
  flex-shrink: 1;
  min-width: 0;
`;

// A chat's messages and turns are not readable through the record API, so the
// header reads the chat itself rather than the record page's relations
const CHAT_HEADER_RECORD_GQL_FIELDS = {
  id: true,
  title: true,
  deletedAt: true,
  updatedAt: true,
  workspaceMemberId: true,
};

type AiChatPageThreadHeaderProps = {
  threadId: string;
};

export const AiChatPageThreadHeader = ({
  threadId,
}: AiChatPageThreadHeaderProps) => {
  const isMobile = useIsMobile();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const recordShowComponentInstanceId =
    useWorkspaceSurfaceScopedComponentInstanceId(
      computeRecordShowComponentInstanceId(threadId),
    );
  const { record, loading } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.AgentChatThread,
    objectRecordId: threadId,
    recordGqlFields: CHAT_HEADER_RECORD_GQL_FIELDS,
    withSoftDeleted: true,
  });
  const { titleFieldContextValue } = useRecordIdentifierTitle({
    objectNameSingular: CoreObjectNameSingular.AgentChatThread,
    objectRecordId: threadId,
  });

  return (
    <RecordComponentInstanceContextsWrapper
      componentInstanceId={recordShowComponentInstanceId}
    >
      <CommandMenuComponentInstanceContext.Provider
        value={{ instanceId: recordShowComponentInstanceId }}
      >
        <RecordShowPageResourceEffect
          loading={loading}
          record={record}
          recordId={threadId}
        />
        <RecordShowPageSSESubscribeEffect
          objectNameSingular={CoreObjectNameSingular.AgentChatThread}
          recordId={threadId}
        />
        <RecordShowContainerContextStoreTargetedRecordsEffect
          recordId={threadId}
        />
        <PageCardHeader
          title={
            <StyledTitle>
              <StyledTitleCell>
                <FieldContext.Provider value={titleFieldContextValue}>
                  <RecordTitleCell
                    sizeVariant="sm"
                    containerType={RecordTitleCellContainerType.PageHeader}
                  />
                </FieldContext.Provider>
              </StyledTitleCell>
              <AiChatThreadRecordTargets
                threadId={threadId}
                instanceId="ai-chat-page-thread-record-targets"
              />
            </StyledTitle>
          }
          actionButton={
            <>
              <RecordShowCommandMenu />
              {!isLayoutCustomizationModeEnabled && <SidePanelToggleButton />}
              {isMobile && <AiChatCloseButton />}
            </>
          }
        />
      </CommandMenuComponentInstanceContext.Provider>
    </RecordComponentInstanceContextsWrapper>
  );
};
