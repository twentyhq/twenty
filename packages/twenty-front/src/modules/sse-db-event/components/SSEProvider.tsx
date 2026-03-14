import { FieldMetadataSSEEffect } from '@/metadata-store/effect-components/FieldMetadataSSEEffect';
import { NavigationMenuItemSSEEffect } from '@/metadata-store/effect-components/NavigationMenuItemSSEEffect';
import { ObjectMetadataItemSSEEffect } from '@/metadata-store/effect-components/ObjectMetadataItemSSEEffect';
import { PageLayoutSSEEffect } from '@/metadata-store/effect-components/PageLayoutSSEEffect';
import { PageLayoutTabSSEEffect } from '@/metadata-store/effect-components/PageLayoutTabSSEEffect';
import { PageLayoutWidgetSSEEffect } from '@/metadata-store/effect-components/PageLayoutWidgetSSEEffect';
import { ViewFieldSSEEffect } from '@/metadata-store/effect-components/ViewFieldSSEEffect';
import { ViewFilterGroupSSEEffect } from '@/metadata-store/effect-components/ViewFilterGroupSSEEffect';
import { ViewFilterSSEEffect } from '@/metadata-store/effect-components/ViewFilterSSEEffect';
import { ViewSortSSEEffect } from '@/metadata-store/effect-components/ViewSortSSEEffect';
import { ViewSSEEffect } from '@/metadata-store/effect-components/ViewSSEEffect';
import { SSEClientEffect } from '@/sse-db-event/components/SSEClientEffect';
import { SSEEventStreamEffect } from '@/sse-db-event/components/SSEEventStreamEffect';
import { SSEQuerySubscribeEffect } from '@/sse-db-event/components/SSEQuerySubscribeEffect';
import { type ReactNode } from 'react';

type SSEProviderProps = {
  children: ReactNode;
};

export const SSEProvider = ({ children }: SSEProviderProps) => {
  return (
    <>
      <SSEClientEffect />
      <SSEEventStreamEffect />
      <SSEQuerySubscribeEffect />
      <NavigationMenuItemSSEEffect />
      <FieldMetadataSSEEffect />
      <ObjectMetadataItemSSEEffect />
      <PageLayoutSSEEffect />
      <PageLayoutTabSSEEffect />
      <PageLayoutWidgetSSEEffect />
      <ViewSSEEffect />
      <ViewFieldSSEEffect />
      <ViewFilterSSEEffect />
      <ViewSortSSEEffect />
      <ViewFilterGroupSSEEffect />
      {children}
    </>
  );
};
