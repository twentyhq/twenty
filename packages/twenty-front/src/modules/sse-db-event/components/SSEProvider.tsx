import { MetadataStoreSSEEffect } from '@/metadata-store/effect-components/MetadataStoreSSEEffect';
import { SSEClientEffect } from '@/sse-db-event/components/SSEClientEffect';
import { SSEEventStreamEffect } from '@/sse-db-event/components/SSEEventStreamEffect';
import { SSEKeepAliveEffect } from '@/sse-db-event/components/SSEKeepAliveEffect';
import { SSEQuerySubscribeEffect } from '@/sse-db-event/components/SSEQuerySubscribeEffect';
import { SSERecordsResyncEffect } from '@/sse-db-event/components/SSERecordsResyncEffect';
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
      <SSEKeepAliveEffect />
      <SSERecordsResyncEffect />
      <MetadataStoreSSEEffect />
      {children}
    </>
  );
};
