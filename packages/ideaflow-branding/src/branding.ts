export const ideaflowBranding = {
  productName: 'IdeaFlow CRM',
  platformName: 'IdeaFlow Studio',
  companyName: 'IdeaFlow Studio',
  supportEmail: 'hello@ideaflow-studio.ru',
  appDomain: 'app.ideaflow-studio.ru',
  publicDomain: 'ideaflow-studio.ru',
  commandDomain: 'command.ideaflow-studio.ru',
  signDomain: 'sign.ideaflow-studio.ru',
  filesDomain: 'files.ideaflow-studio.ru',
  defaultWorkspaceName: 'IdeaFlow Studio',
} as const;

export type IdeaFlowBranding = typeof ideaflowBranding;

export const productName = ideaflowBranding.productName;
export const platformName = ideaflowBranding.platformName;
export const companyName = ideaflowBranding.companyName;
export const supportEmail = ideaflowBranding.supportEmail;
export const appDomain = ideaflowBranding.appDomain;
export const publicDomain = ideaflowBranding.publicDomain;
export const commandDomain = ideaflowBranding.commandDomain;
export const signDomain = ideaflowBranding.signDomain;
export const filesDomain = ideaflowBranding.filesDomain;
export const defaultWorkspaceName = ideaflowBranding.defaultWorkspaceName;
