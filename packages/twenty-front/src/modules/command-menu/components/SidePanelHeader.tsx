import { SidePanelHeaderTitleSyncEffect } from '@/command-menu/components/SidePanelHeaderSyncEffect';
import { useUpdateCommandMenuPageInfo } from '@/command-menu/hooks/useUpdateCommandMenuPageInfo';
import { commandMenuShouldFocusTitleInputComponentState } from '@/command-menu/states/commandMenuShouldFocusTitleInputComponentState';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';
import { AppTooltip, type IconComponent } from 'twenty-ui/display';

const StyledHeader = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: row;
  padding: ${({ theme }) => theme.spacing(4)};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledHeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledHeaderTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  font-size: ${({ theme }) => theme.font.size.xl};
  width: fit-content;
  max-width: 420px;
  & > input:disabled {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledHeaderType = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  padding-left: ${({ theme }) => theme.spacing(1)};
`;

const StyledHeaderIconContainer = styled.div`
  align-self: flex-start;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: ${({ theme }) => theme.spacing(2)};
`;

type SidePanelHeaderProps = {
  Icon: IconComponent;
  iconColor: string;
  initialTitle: string;
  headerType: string;
  iconTooltip?: string;
} & (
  | {
      disabled: true;
      onTitleChange?: never;
    }
  | {
      disabled?: boolean;
      onTitleChange: (newTitle: string) => void;
    }
);

export const SidePanelHeader = ({
  Icon,
  iconColor,
  initialTitle,
  headerType,
  disabled,
  onTitleChange,
  iconTooltip,
}: SidePanelHeaderProps) => {
  const [shouldFocusTitleInput, setShouldFocusTitleInput] =
    useRecoilComponentState(commandMenuShouldFocusTitleInputComponentState);

  const theme = useTheme();

  const [title, setTitle] = useState(initialTitle);

  const { updateCommandMenuPageInfo } = useUpdateCommandMenuPageInfo();

  const handleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  const saveTitle = () => {
    onTitleChange?.(title);
    updateCommandMenuPageInfo({
      pageTitle: title,
      pageIcon: Icon,
    });
  };

  const tooltipId = `side-panel-icon-tooltip-${headerType.replace(/\s+/g, '-')}`;

  return (
    <>
      <SidePanelHeaderTitleSyncEffect
        initialTitle={initialTitle}
        setTitle={setTitle}
      />
      <StyledHeader data-testid="side-panel-header">
        <StyledHeaderIconContainer id={tooltipId}>
          <Icon
            color={iconColor}
            stroke={theme.icon.stroke.sm}
            size={theme.icon.size.lg}
          />
        </StyledHeaderIconContainer>
        {iconTooltip && (
          <AppTooltip
            anchorSelect={`#${tooltipId}`}
            content={iconTooltip}
            place="top"
          />
        )}
        <StyledHeaderInfo>
          <StyledHeaderTitle>
            <TitleInput
              instanceId="side-panel-title-input"
              disabled={disabled}
              sizeVariant="md"
              value={title}
              onChange={handleChange}
              placeholder={headerType}
              onEnter={saveTitle}
              onEscape={() => {
                setTitle(initialTitle);
              }}
              onClickOutside={saveTitle}
              onTab={saveTitle}
              onShiftTab={saveTitle}
              shouldOpen={shouldFocusTitleInput}
              onOpen={() => setShouldFocusTitleInput(false)}
            />
          </StyledHeaderTitle>
          <StyledHeaderType>{headerType}</StyledHeaderType>
        </StyledHeaderInfo>
      </StyledHeader>
    </>
  );
};
