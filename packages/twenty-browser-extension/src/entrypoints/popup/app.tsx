import { sendMessage } from '@/utils/messaging';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
const StyledMain = styled.main``;

function App() {
  const [value, setValue] = useState<{firstName: string; lastName: string} | undefined>();
  useEffect(() => {
    sendMessage('getPersonviaRelay').then(data => {
      setValue(data)
    })
  }, []);
  return (
    <StyledMain>
      <h1>{JSON.stringify(value)}</h1>
      <button onClick={async () => {
        if (!value?.firstName || !value?.lastName) {
          return;
        }
        await sendMessage('createPerson', {
          firstName: value.firstName,
          lastName: value.lastName,
        });

      }}>save to twenty</button>
    </StyledMain>
  );
}

export default App;
