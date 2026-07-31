import { styled } from '@linaria/react';
import { IconArrowsDiagonal, IconUserCircle } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type OpenRecordInCardMediaProps = {
  type: 'member-preference' | 'side-panel' | 'full-page';
};

const StyledPreviewFrame = styled.div`
  background-color: ${themeCssVariables.border.color.medium};
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
  overflow: hidden;
  padding: 2px;
`;

const StyledMemberPreferenceCanvas = styled(StyledPreviewCanvas)`
  flex-direction: column;
  position: relative;
`;

const StyledMemberPreferenceIcon = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.secondary};
  border-radius: 50%;
  box-sizing: border-box;
  color: ${themeCssVariables.color.blue7};
  display: flex;
  height: 16px;
  justify-content: center;
  left: 50%;
  padding: 1px;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
`;

const StyledSidePanelPreview = styled.div`
  display: flex;
  flex: 1;
  gap: 2px;
  min-height: 0;
`;

const StyledSidePanelContent = styled.div`
  background-color: ${themeCssVariables.border.color.medium};
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
  min-height: 0;
`;

const SidePanelPreview = () => (
  <StyledSidePanelPreview>
    <StyledSidePanelContent />
    <StyledSidePanel />
  </StyledSidePanelPreview>
);

export const OpenRecordInCardMedia = ({ type }: OpenRecordInCardMediaProps) => {
  if (type === 'member-preference') {
    return (
      <StyledPreviewFrame>
        <StyledMemberPreferenceCanvas>
          <SidePanelPreview />
          <StyledFullPage />
          <StyledMemberPreferenceIcon>
            <IconUserCircle size={14} />
          </StyledMemberPreferenceIcon>
        </StyledMemberPreferenceCanvas>
      </StyledPreviewFrame>
    );
  }

  return (
    <StyledPreviewFrame>
      <StyledPreviewCanvas>
        {type === 'side-panel' ? (
          <SidePanelPreview />
        ) : (
          <StyledFullPage>
            <IconArrowsDiagonal size={14} />
          </StyledFullPage>
        )}
      </StyledPreviewCanvas>
    </StyledPreviewFrame>
  );
};
