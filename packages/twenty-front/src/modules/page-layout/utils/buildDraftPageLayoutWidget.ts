import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isVerticalListPosition } from '@/page-layout/utils/isVerticalListPosition';
import {
  type PageLayoutWidgetGridPosition,
  type PageLayoutWidgetVerticalListPosition,
  type WidgetType,
} from '~/generated-metadata/graphql';

type BuildDraftPageLayoutWidgetParams = {
  id: string;
  pageLayoutTabId: string;
  title: string;
  type: WidgetType;
  configuration: PageLayoutWidget['configuration'];
  position: PageLayoutWidgetGridPosition | PageLayoutWidgetVerticalListPosition;
  objectMetadataId?: string | null;
};

export const buildDraftPageLayoutWidget = ({
  id,
  pageLayoutTabId,
  title,
  type,
  configuration,
  position,
  objectMetadataId,
}: BuildDraftPageLayoutWidgetParams): PageLayoutWidget => ({
  __typename: 'PageLayoutWidget',
  id,
  applicationId: '',
  universalIdentifier: id,
  isSystemSideEffect: false,
  pageLayoutTabId,
  title,
  isActive: true,
  type,
  configuration,
  position: isVerticalListPosition(position)
    ? { ...position, __typename: 'PageLayoutWidgetVerticalListPosition' }
    : { ...position, __typename: 'PageLayoutWidgetGridPosition' },
  objectMetadataId: objectMetadataId ?? null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
});
