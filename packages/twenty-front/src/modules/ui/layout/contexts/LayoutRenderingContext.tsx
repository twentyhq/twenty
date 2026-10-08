import { type PageLayoutType } from '~/generated-metadata/graphql';
import { createRequiredContext } from '~/utils/createRequiredContext';
import { type TargetRecordIdentifier } from './TargetRecordIdentifier';

export type LayoutRenderingContextType = {
  targetRecordIdentifier: TargetRecordIdentifier | undefined;

  layoutType: PageLayoutType;

  // A page that already shows the record's title can drop the identifier bar
  isRecordIdentifierBarHidden?: boolean;
};

export const [LayoutRenderingProvider, useLayoutRenderingContext] =
  createRequiredContext<LayoutRenderingContextType>('LayoutRenderingContext');
