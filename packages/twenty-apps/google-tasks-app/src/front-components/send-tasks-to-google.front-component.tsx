import { defineFrontComponent } from 'twenty-sdk/define';
import { Command, useSelectedRecordIds } from 'twenty-sdk/front-component';

import { SEND_TASKS_TO_GOOGLE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { requestTasksPush } from 'src/front-components/utils/request-tasks-push.util';

const SendTasksToGoogle = () => {
  const taskIds = useSelectedRecordIds();

  return <Command execute={() => requestTasksPush({ taskIds })} />;
};

export default defineFrontComponent({
  universalIdentifier:
    SEND_TASKS_TO_GOOGLE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'send-tasks-to-google',
  description:
    'Sends the selected tasks to the Google Tasks account of the requester.',
  component: SendTasksToGoogle,
  isHeadless: true,
});
