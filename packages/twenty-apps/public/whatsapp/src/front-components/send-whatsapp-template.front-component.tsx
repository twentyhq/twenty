import 'twenty-ui/style.css';
import 'twenty-ui/theme-dark.css';
import 'twenty-ui/theme-light.css';

import { defineFrontComponent } from 'twenty-sdk/define';
import { useColorScheme } from 'twenty-sdk/front-component';
import { ThemeProvider } from 'twenty-ui/theme';

import { WHATSAPP_SEND_TEMPLATE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { SendWhatsAppTemplateForm } from 'src/front-components/components/SendWhatsAppTemplateForm';

const SendWhatsAppTemplate = () => {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider colorScheme={colorScheme}>
      <SendWhatsAppTemplateForm />
    </ThemeProvider>
  );
};

export default defineFrontComponent({
  universalIdentifier: WHATSAPP_SEND_TEMPLATE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'send-whatsapp-template',
  description: 'Form to send an approved WhatsApp template to the selected people, with its parameters and a preview.',
  component: SendWhatsAppTemplate,
});
