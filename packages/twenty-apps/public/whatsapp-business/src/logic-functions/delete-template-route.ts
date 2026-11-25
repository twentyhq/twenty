import { z } from 'zod';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { WHATSAPP_TEMPLATE_ROUTE_PATHS } from 'src/constants/whatsapp-template-route-paths.constant';
import { WHATSAPP_LOGIC_FUNCTION_DELETE_TEMPLATE_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { currentUserCanManageApplications } from 'src/logic-functions/data/current-user-can-manage-applications.util';
import { deleteWhatsAppTemplate } from 'src/logic-functions/data/delete-whatsapp-template.util';
import { type TemplateRouteResult } from 'src/logic-functions/types/template-route-result.type';

const deleteTemplatesParamsSchema = z.object({ templateIds: z.array(z.string().min(1)).min(1).max(50) });

const handler = async (params: RoutePayload<unknown>): Promise<TemplateRouteResult> => {
  if (!(await currentUserCanManageApplications())) {
    return { success: false, error: 'Only members who can manage applications can delete WhatsApp templates.' };
  }

  const parsedParams = deleteTemplatesParamsSchema.safeParse(params.body);

  if (!parsedParams.success) {
    return { success: false, error: z.prettifyError(parsedParams.error) };
  }

  for (const templateId of parsedParams.data.templateIds) {
    try {
      await deleteWhatsAppTemplate(templateId);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  return { success: true };
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_DELETE_TEMPLATE_ROUTE_UNIVERSAL_IDENTIFIER,
  name: 'delete-template-route',
  description: 'Deletes the selected WhatsApp templates in Meta, from the delete command in Twenty',
  timeoutSeconds: 60,
  handler,
  httpRouteTriggerSettings: { path: WHATSAPP_TEMPLATE_ROUTE_PATHS.delete, httpMethod: 'POST', isAuthRequired: true },
});
