export type IdeaFlowTheme = Readonly<{
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  border: string;
  danger: string;
  success: string;
  warning: string;
}>;

export const ideaflowTheme: IdeaFlowTheme = {
  primary: '#2563EB',
  secondary: '#0F766E',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  mutedText: '#475569',
  border: '#CBD5E1',
  danger: '#DC2626',
  success: '#15803D',
  warning: '#D97706',
};

export const primary = ideaflowTheme.primary;
export const secondary = ideaflowTheme.secondary;
export const background = ideaflowTheme.background;
export const surface = ideaflowTheme.surface;
export const text = ideaflowTheme.text;
export const mutedText = ideaflowTheme.mutedText;
export const border = ideaflowTheme.border;
export const danger = ideaflowTheme.danger;
export const success = ideaflowTheme.success;
export const warning = ideaflowTheme.warning;
