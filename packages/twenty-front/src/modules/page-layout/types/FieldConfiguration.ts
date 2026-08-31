import {
  type FieldDisplayMode,
  type WidgetConfigurationType,
} from '~/generated-metadata/graphql';
import { type ViewerControlsConfiguration } from 'twenty-shared/types';

export type FieldConfiguration = {
  __typename: 'FieldConfiguration';
  configurationType: WidgetConfigurationType.FIELD;
  fieldMetadataId: string;
  fieldDisplayMode: FieldDisplayMode;
  viewId?: string;
  nestedRelationFieldMetadataId?: string | null;
  isUIEditable?: boolean;
  viewerControls?: ViewerControlsConfiguration;
};
