import { ButtonContractsExample } from '@/__stories__/twenty-ui-gallery/button-contracts-example';
import { defineFrontComponent } from 'twenty-sdk/define';
import 'twenty-ui/style.css';
import { ThemeProvider } from 'twenty-ui/theme';

const ButtonContracts = () => (
  <ThemeProvider colorScheme="light">
    <ButtonContractsExample />
  </ThemeProvider>
);

export default defineFrontComponent({
  universalIdentifier: '1c8d8d4a-a5d5-49f9-806b-69d5ad573ba7',
  name: 'twenty-ui-button-contracts',
  description:
    'Button native rendering and appearance contracts in the sandbox',
  component: ButtonContracts,
});
