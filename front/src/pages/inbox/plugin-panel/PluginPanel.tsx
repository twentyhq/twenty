import styled from '@emotion/styled';
import PluginPanelNav from './PluginPanelNav';
import PluginHistory from './plugin-history/PanelHistory';

const StyledPanel = styled.div`
  display: flex;
  width: 350px;
  border-left: 1px solid #eaecee;
`;

const StyledContainer = styled.div`
  display: flex;
  flex-grow: 1;
`;

function PluginPanel() {
  return (
    <StyledPanel>
      <StyledContainer>
        <PluginHistory />
      </StyledContainer>
      <PluginPanelNav />
    </StyledPanel>
  );
}

export default PluginPanel;
