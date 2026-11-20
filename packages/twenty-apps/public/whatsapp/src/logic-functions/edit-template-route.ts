import { z } from 'zod';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { WHATSAPP_TEMPLATE_ROUTE_PATHS } from 'src/constants/whatsapp-template-route-paths.constant';
import { WHATSAPP_LOGIC_FUNCTION_EDIT_TEMPLATE_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { currentUserCanManageApplications } from 'src/logic-functions/data/current-user-can-manage-applications.util';
import { editTemplateParamsSchema } from 'src/logic-functions/data/edit-template-params.schema';
import { editWhatsAppTemplate } from 'src/logic-functions/data/edit-whatsapp-template.util';
import { type TemplateRouteResult } from 'src/logic-functions/types/template-route-result.type';

const handler = async (params: RoutePayload<unknown>): Promise<TemplateRouteResult> => {
  if (!(await currentUserCanManageApplications())) {
    return { success: false, error: 'Only members who can manage applications can edit WhatsApp templates.' };
  }

  const parsedParams = editTemplateParamsSchema.safeParse(params.body);

  if (!parsedParams.success) {
    return { success: false, error: z.prettifyError(parsedParams.error) };
  }

  try {
    await editWhatsAppTemplate(parsedParams.data);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }

  return { success: true };
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_EDIT_TEMPLATE_ROUTE_UNIVERSAL_IDENTIFIER,
  name: 'edit-template-route',
  description: 'Edits a WhatsApp template from the edit form in Twenty',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: { path: WHATSAPP_TEMPLATE_ROUTE_PATHS.edit, httpMethod: 'POST', isAuthRequired: true },
});
