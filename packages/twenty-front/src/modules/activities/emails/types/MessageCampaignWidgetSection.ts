export type MessageCampaignWidgetSection = 'details' | 'body';

export const MESSAGE_CAMPAIGN_DETAILS_WIDGET_TITLE = 'Details';

export const getMessageCampaignWidgetSection = (
  widgetTitle: string,
): MessageCampaignWidgetSection =>
  widgetTitle === MESSAGE_CAMPAIGN_DETAILS_WIDGET_TITLE ? 'details' : 'body';
