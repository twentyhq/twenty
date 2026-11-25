import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  Command,
  enqueueSnackbar,
  openCommandConfirmationModal,
  useSelectedRecordIds,
  useTranslate,
} from 'twenty-sdk/front-component';

import { WHATSAPP_DELETE_TEMPLATE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { WHATSAPP_TEMPLATE_ROUTE_PATHS } from 'src/constants/whatsapp-template-route-paths.constant';
import { type TemplateRouteResult } from 'src/logic-functions/types/template-route-result.type';

const DeleteWhatsAppTemplates = () => {
  const { t } = useTranslate();
  const templateIds = useSelectedRecordIds();

  const execute = async () => {
    const choice = await openCommandConfirmationModal({
      title: t('Delete in WhatsApp?'),
      subtitle: t(
        'The {count} selected templates are deleted in Meta and can no longer be sent. Their names cannot be reused for 30 days.',
        { count: templateIds.length },
      ),
      confirmButtonText: t('Delete'),
      confirmButtonAccent: 'danger',
    });

    if (choice !== 'confirm') {
      return;
    }

    try {
      const result = await new RestApiClient().post<TemplateRouteResult>(`/s${WHATSAPP_TEMPLATE_ROUTE_PATHS.delete}`, {
        templateIds,
      });

      await enqueueSnackbar(
        result.success
          ? { message: t('WhatsApp templates deleted.'), variant: 'success' }
          : { message: result.error, variant: 'error' },
      );
    } catch {
      await enqueueSnackbar({ message: t('Could not delete the WhatsApp templates. Try again.'), variant: 'error' });
    }
  };

  return <Command execute={execute} />;
};

export default defineFrontComponent({
  universalIdentifier: WHATSAPP_DELETE_TEMPLATE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'delete-whatsapp-templates',
  description: 'Deletes the selected WhatsApp templates in Meta after a confirmation.',
  component: DeleteWhatsAppTemplates,
  isHeadless: true,
});
