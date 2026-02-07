import { type PropertySchema } from '@/front-component/types/PropertySchema';

export type AllowedUiComponent = {
  tag: string;
  name: string;
  properties: Record<string, PropertySchema>;
  componentImport: string;
  componentPath: string;
};

export const ALLOWED_UI_COMPONENTS: AllowedUiComponent[] = [
  {
    tag: 'twenty-ui-button',
    name: 'TwentyUiButton',
    properties: {
      title: { type: 'string', optional: true },
      variant: { type: 'string', optional: true },
      accent: { type: 'string', optional: true },
      size: { type: 'string', optional: true },
      disabled: { type: 'boolean', optional: true },
      fullWidth: { type: 'boolean', optional: true },
    },
    componentImport: 'Button',
    componentPath: 'twenty-ui/input',
  },
];
