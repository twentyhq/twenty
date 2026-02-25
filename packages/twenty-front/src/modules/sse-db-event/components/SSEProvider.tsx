import { FieldMetadataSSEEffect } from '@/metadata-store/effect-components/FieldMetadataSSEEffect';
import { ObjectMetadataSSEEffect } from '@/metadata-store/effect-components/ObjectMetadataItemSSEEffect';
import { ViewFieldSSEEffect } from '@/metadata-store/effect-components/ViewFieldSSEEffect';
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
      <FieldMetadataSSEEffect />
      <ObjectMetadataSSEEffect />
      <ViewFieldSSEEffect />
      <ViewSSEEffect />
      {children}
    </>
  );
};
