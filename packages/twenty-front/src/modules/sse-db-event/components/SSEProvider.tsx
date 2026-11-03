import { MetadataStoreSSEEffect } from '@/metadata-store/effect-components/MetadataStoreSSEEffect';
import { SSEClientEffect } from '@/sse-db-event/components/SSEClientEffect';
import { SSEEventStreamEffect } from '@/sse-db-event/components/SSEEventStreamEffect';
import { SSEKeepAliveEffect } from '@/sse-db-event/components/SSEKeepAliveEffect';
import { SSEQuerySubscribeEffect } from '@/sse-db-event/components/SSEQuerySubscribeEffect';
import { RecordCacheStaleQueriesSSEEffect } from '@/object-record/cache/components/RecordCacheStaleQueriesSSEEffect';
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
      <MetadataStoreSSEEffect />
      <RecordCacheStaleQueriesSSEEffect />
      {children}
    </>
  );
};
