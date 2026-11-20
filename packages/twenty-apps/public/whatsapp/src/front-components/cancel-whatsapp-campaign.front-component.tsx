import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  Command,
  enqueueSnackbar,
  openCommandConfirmationModal,
  useSelectedRecordIds,
  useTranslate,
} from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';

import { WHATSAPP_CAMPAIGN_ROUTE_PATHS } from 'src/constants/whatsapp-campaign-route-paths.constant';
import { WHATSAPP_CANCEL_CAMPAIGN_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type TemplateRouteResult } from 'src/logic-functions/types/template-route-result.type';

const CancelWhatsAppCampaign = () => {
  const { t } = useTranslate();
  const [campaignId] = useSelectedRecordIds();

  const execute = async () => {
    if (!isDefined(campaignId)) {
      return;
    }

    const choice = await openCommandConfirmationModal({
      title: t('Cancel this WhatsApp campaign?'),
      subtitle: t('Messages not sent yet are skipped. Messages already sent stay delivered.'),
      confirmButtonText: t('Cancel campaign'),
      confirmButtonAccent: 'danger',
    });

    if (choice !== 'confirm') {
      return;
    }

    try {
      const result = await new RestApiClient().post<TemplateRouteResult>(`/s${WHATSAPP_CAMPAIGN_ROUTE_PATHS.cancel}`, {
        campaignId,
      });

      await enqueueSnackbar(
        result.success
          ? { message: t('WhatsApp campaign cancelled.'), variant: 'success' }
          : { message: result.error, variant: 'error' },
      );
    } catch {
      await enqueueSnackbar({ message: t('Could not cancel the WhatsApp campaign. Try again.'), variant: 'error' });
    }
  };

  return <Command execute={execute} />;
};

export default defineFrontComponent({
  universalIdentifier: WHATSAPP_CANCEL_CAMPAIGN_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'cancel-whatsapp-campaign',
  description: 'Cancels the selected WhatsApp campaign after a confirmation.',
  component: CancelWhatsAppCampaign,
  isHeadless: true,
});
