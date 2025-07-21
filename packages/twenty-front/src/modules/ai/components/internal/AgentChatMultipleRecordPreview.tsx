import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { CommandMenuContextRecordChipAvatars } from '@/command-menu/components/CommandMenuContextRecordChipAvatars';
import { getSelectedRecordsContextText } from '@/command-menu/utils/getRecordContextText';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { MultipleAvatarChip } from 'twenty-ui/components';
import { t } from '@lingui/core/macro';
import { IconX, IconReload } from 'twenty-ui/display';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { isAgentChatCurrentContextActiveState } from '@/ai/states/isAgentChatCurrentContextActiveState';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';

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

export const AgentChatMultipleRecordPreview = ({
  objectMetadataItem,
  records,
  totalCount,
}: {
  objectMetadataItem: ObjectMetadataItem;
  records: ObjectRecord[];
  totalCount: number;
}) => {
  const [isAgentChatCurrentContextActive, setIsAgentChatCurrentContextActive] =
    useRecoilComponentStateV2(isAgentChatCurrentContextActiveState);

  const theme = useTheme();

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
      totalCount,
    ),
    Icons: Avatars,
    withIconBackground: false,
  };

  const toggleIsAgentChatCurrentContextActive = () => {
    setIsAgentChatCurrentContextActive(!isAgentChatCurrentContextActive);
  };

  return (
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
  );
};
