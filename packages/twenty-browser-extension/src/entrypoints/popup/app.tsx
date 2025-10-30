import { sendMessage } from '@/utils/messaging';
import styled from '@emotion/styled';
const StyledMain = styled.main``;

function App() {

  const [value, setValue] = useState<{firstName: string; lastName: string} | undefined | {companyName: string}>();
  useEffect(() => {
    sendMessage('getPersonviaRelay').then(data => {
      setValue(data)
    })
  }, []);
  return (
    <StyledMain>
      <h1>{JSON.stringify(value)}</h1>
    </StyledMain>
  );
}

export default App;
