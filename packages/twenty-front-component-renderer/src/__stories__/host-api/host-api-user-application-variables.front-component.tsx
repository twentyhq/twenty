import { useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  getUserApplicationVariables,
  updateUserApplicationVariable,
  useFrontComponentExecutionContext,
} from 'twenty-sdk/front-component';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { BUTTON_STYLE } from '@/__stories__/shared/front-components/styles';

// Immediate module reads must work before the component's first render.
const initialVariables = getUserApplicationVariables().then(
  (variables) => variables.THEME,
  (error: unknown) =>
    error instanceof Error ? error.message : 'Unable to read preferences',
);

const HostApiUserApplicationVariablesFrontComponent = () => {
  const [status, setStatus] = useState('Loading preferences');
  const connectedAccountId = useFrontComponentExecutionContext(
    (context) => context.connectedAccountId,
  );

  useEffect(() => {
    initialVariables.then(setStatus);
  }, []);

  const handleSave = async () => {
    try {
      await updateUserApplicationVariable({ key: 'THEME', value: 'light' });
      const variables = await getUserApplicationVariables();

      setStatus(`Saved theme: ${variables.THEME}`);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : 'Unable to save preferences',
      );
    }
  };

  return (
    <FrontComponentCard title="Personal settings">
      <p>Account: {connectedAccountId ?? 'none'}</p>
      <p>{status}</p>
      <button type="button" style={BUTTON_STYLE} onClick={handleSave}>
        Save theme
      </button>
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    'fc-host-user-preferences-00000000-0000-0000-0000-000000000022',
  name: 'host-api-user-application-variables',
  description: 'Personal settings host access and immediate module reads',
  component: HostApiUserApplicationVariablesFrontComponent,
});
