import { isAgentChatCurrentContextActiveState } from '@/ai/states/isAgentChatCurrentContextActiveState';
import { CommandMenuContextRecordChipAvatars } from '@/command-menu/components/CommandMenuContextRecordChipAvatars';
import { getSelectedRecordsContextText } from '@/command-menu/utils/getRecordContextText';
import { useFindManyRecordsSelectedInContextStore } from '@/context-store/hooks/useFindManyRecordsSelectedInContextStore';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { MultipleAvatarChip } from 'twenty-ui/components';
import { IconReload, IconX } from 'twenty-ui/display';

const StyledRightIconContainer = styled.div`
  display: flex;
  border-left: 1px solid ${({ theme }) => theme.border.color.light};

  svg {
    cursor: pointer;
  }
`;

const StyledChipWrapper = styled.div<{ isActive: boolean }>`
  opacity: ${({ isActive }) => (isActive ? 1 : 0.7)};
`;

export const AgentChatContextRecordPreview = ({
  agentId,
  contextStoreCurrentObjectMetadataItemId,
}: {
  agentId: string;
  contextStoreCurrentObjectMetadataItemId: string;
}) => {
  const theme = useTheme();

  const { records, totalCount } = useFindManyRecordsSelectedInContextStore({
    limit: 3,
  });

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: contextStoreCurrentObjectMetadataItemId,
  });

  const [isAgentChatCurrentContextActive, setIsAgentChatCurrentContextActive] =
    useRecoilComponentState(isAgentChatCurrentContextActiveState, agentId);

  const Avatars = records.map((record) => (
    // @todo move this components to be less specific. (Outside of CommandMenu
    <CommandMenuContextRecordChipAvatars
      objectMetadataItem={objectMetadataItem}
      key={record.id}
      record={record}
    />
  ));

  const recordSelectionContextChip = {
    // @todo move this utils outside of CommandMenu
    text: getSelectedRecordsContextText(
      objectMetadataItem,
      records,
      totalCount ?? 0,
    ),
    Icons: Avatars,
    withIconBackground: false,
  };

  const toggleIsAgentChatCurrentContextActive = () => {
    setIsAgentChatCurrentContextActive(!isAgentChatCurrentContextActive);
  };

  return (
    <>
      {records.length !== 0 && (
        <StyledChipWrapper isActive={isAgentChatCurrentContextActive}>
          <MultipleAvatarChip
            Icons={recordSelectionContextChip.Icons}
            text={
              isAgentChatCurrentContextActive
                ? recordSelectionContextChip.text
                : t`Context`
            }
            maxWidth={180}
            rightComponent={
              <StyledRightIconContainer>
                {isAgentChatCurrentContextActive ? (
                  <IconX
                    size={theme.icon.size.sm}
                    color={theme.font.color.secondary}
                    onClick={toggleIsAgentChatCurrentContextActive}
                  />
                ) : (
                  <IconReload
                    size={theme.icon.size.sm}
                    color={theme.font.color.secondary}
                    onClick={toggleIsAgentChatCurrentContextActive}
                  />
                )}
              </StyledRightIconContainer>
            }
          />
        </StyledChipWrapper>
      )}
    </>
  );
};
