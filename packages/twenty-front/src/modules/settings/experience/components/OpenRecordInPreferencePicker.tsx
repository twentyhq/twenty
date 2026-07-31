import { useOpenRecordInPreference } from '@/settings/experience/hooks/useOpenRecordInPreference';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type KeyboardEvent } from 'react';
import { OpenRecordIn } from 'twenty-shared/types';
import { IconArrowsDiagonal } from 'twenty-ui/icon';
import { Radio } from 'twenty-ui/input';
import { Card, CardContent } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledOption = styled.div`
  > * {
    align-items: center;
    display: flex;
    gap: ${themeCssVariables.spacing[4]};
  }
`;

const StyledPreviewFrame = styled.div`
  background-color: ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  height: 40px;
  padding: 2px;
  width: 32px;
`;

const StyledPreviewCanvas = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border-radius: 2px;
  display: flex;
  flex: 1;
  gap: 2px;
  min-width: 0;
  padding: 2px;
`;

const StyledSidePanelContent = styled.div`
  background-color: ${themeCssVariables.background.transparent.light};
  border-radius: 1px;
  flex: 1;
`;

const StyledSidePanel = styled.div`
  background-color: ${themeCssVariables.color.blue7};
  border-radius: 1px;
  width: 6px;
`;

const StyledFullPage = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.color.blue7};
  border-radius: 1px;
  color: ${themeCssVariables.font.color.inverted};
  display: flex;
  flex: 1;
  justify-content: center;
`;

const StyledTextContainer = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledDescription = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: ${themeCssVariables.text.lineHeight.lg};
`;

const StyledRadioContainer = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
`;

const SidePanelPreview = () => (
  <StyledPreviewFrame>
    <StyledPreviewCanvas>
      <StyledSidePanelContent />
      <StyledSidePanel />
    </StyledPreviewCanvas>
  </StyledPreviewFrame>
);

const FullPagePreview = () => (
  <StyledPreviewFrame>
    <StyledPreviewCanvas>
      <StyledFullPage>
        <IconArrowsDiagonal size={14} />
      </StyledFullPage>
    </StyledPreviewCanvas>
  </StyledPreviewFrame>
);

export const OpenRecordInPreferencePicker = () => {
  const { t } = useLingui();

  const { openRecordInPreference, setOpenRecordInPreference } =
    useOpenRecordInPreference();

  const options = [
    {
      value: OpenRecordIn.SIDE_PANEL,
      title: t`Side panel`,
      description: t`Open records alongside the current page`,
      Preview: SidePanelPreview,
    },
    {
      value: OpenRecordIn.RECORD_PAGE,
      title: t`Full page`,
      description: t`Open records on a dedicated page`,
      Preview: FullPagePreview,
    },
  ];

  const handleSelect = (value: OpenRecordIn) => {
    void setOpenRecordInPreference(value);
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    value: OpenRecordIn,
  ) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    handleSelect(value);
  };

  return (
    <Card fullWidth rounded role="radiogroup">
      {options.map((option, index) => {
        const isSelected = option.value === openRecordInPreference;

        return (
          <StyledOption key={option.value}>
            <CardContent
              aria-checked={isSelected}
              divider={index < options.length - 1}
              hasHoverHighlight
              isClickable
              onClick={() => handleSelect(option.value)}
              onKeyDown={(event) => handleKeyDown(event, option.value)}
              role="radio"
              tabIndex={0}
            >
              <option.Preview />
              <StyledTextContainer>
                <StyledTitle>{option.title}</StyledTitle>
                <StyledDescription>{option.description}</StyledDescription>
              </StyledTextContainer>
              <StyledRadioContainer
                onClick={(event) => event.stopPropagation()}
              >
                <Radio
                  checked={isSelected}
                  name="open-record-in-preference"
                  onCheckedChange={() => handleSelect(option.value)}
                  value={option.value}
                />
              </StyledRadioContainer>
            </CardContent>
          </StyledOption>
        );
      })}
    </Card>
  );
};
