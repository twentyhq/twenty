import 'twenty-ui/style.css';
import 'twenty-ui/theme-dark.css';
import 'twenty-ui/theme-light.css';

import { defineFrontComponent } from 'twenty-sdk/define';
import { useColorScheme } from 'twenty-sdk/front-component';
import { ThemeProvider } from 'twenty-ui/theme';

import { WHATSAPP_EDIT_TEMPLATE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { EditWhatsAppTemplateForm } from 'src/front-components/components/EditWhatsAppTemplateForm';

const EditWhatsAppTemplate = () => {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider colorScheme={colorScheme}>
      <EditWhatsAppTemplateForm />
    </ThemeProvider>
  );
};

export default defineFrontComponent({
  universalIdentifier: WHATSAPP_EDIT_TEMPLATE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'edit-whatsapp-template',
  description: 'Form to change the category or the content of a WhatsApp template and submit it for review.',
  component: EditWhatsAppTemplate,
});
