import { sendMessage } from '@/utils/messaging';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
const StyledMain = styled.main``;

type PersonValue = { firstName: string; lastName: string; type: 'company' | 'person' };
type CompanyValue = { companyName: string; type: 'company' | 'person' };
type Value = PersonValue | CompanyValue | undefined;

function App() {
  const [value, setValue] = useState<Value>();
  useEffect(() => {
    browser.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const currentTab = tabs[0];

      if (!currentTab.url) {
        return;
      }

      let url = new URL(currentTab.url);

      const isLinkedinHost =
        url.protocol === 'https:' && url.hostname === 'www.linkedin.com';

      if (isLinkedinHost && url.pathname.startsWith('/in/')) {
        sendMessage('getPersonviaRelay').then((data) => {
          setValue({ ...data, type: 'person' });
        });
      }

      if (isLinkedinHost && url.pathname.startsWith('/company/')) {
        sendMessage('getCompanyviaRelay').then((data) => {
          setValue({ ...data, type: 'company' });
        });
      }
    });
  }, []);

  const isPersonValue = (val: Value): val is PersonValue => {
    return val !== undefined && 'firstName' in val && 'lastName' in val;
  };

  const isCompanyValue = (val: Value): val is CompanyValue => {
    return val !== undefined && 'companyName' in val;
  };

  return (
    <StyledMain>
      <h1>{JSON.stringify(value)}</h1>
      {isPersonValue(value) && (
        <button
          onClick={async () => {
            await sendMessage('createPerson', {
              firstName: value.firstName,
              lastName: value.lastName,
            });
          }}
        >
          save person to twenty
        </button>
      )}
      {isCompanyValue(value) && (
        <button
          onClick={async () => {
            await sendMessage('createCompany', {
              name: value.companyName,
            });
          }}
        >
          save company to twenty
        </button>
      )}
    </StyledMain>
  );
}

export default App;
