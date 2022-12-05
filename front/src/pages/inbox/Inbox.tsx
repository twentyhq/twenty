import FullWidthContainer from '../../layout/containers/FullWidthContainer';
import DiscussionPanel from './discussion-panel/DiscussionPanel';
import ListPanel from './list-panel/ListPanel';
import PluginPanel from './plugin-panel/PluginPanel';

function Inbox() {
  return (
    <FullWidthContainer>
      <>
        <ListPanel />
        <DiscussionPanel />
        <PluginPanel />
      </>
    </FullWidthContainer>
  );
}

export default Inbox;
