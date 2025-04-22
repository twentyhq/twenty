import { PlaygroundSchemas } from '@/settings/playground/types/PlaygroundSchemas';
import { msg } from '@lingui/core/macro';
import { IconBracketsAngle, IconFolderRoot } from 'twenty-ui/display';
export const SETTINGS_PLAYGROUND_FORM_SCHEMA_SELECT_OPTIONS = [
  {
    value: PlaygroundSchemas.CORE,
    label: msg`Core`,
    Icon: IconFolderRoot,
  },
  {
    value: PlaygroundSchemas.METADATA,
    label: msg`Metadata`,
    Icon: IconBracketsAngle,
  },
];
