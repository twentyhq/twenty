import { useQuery } from '@apollo/client';
import { RemoteReceiver, RemoteRootRenderer } from '@remote-dom/react/host';
import { useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { FrontComponentWorkerEffect } from '@/page-layout/widgets/front-component/components/FrontComponentWorkerEffect';
import { GET_FRONT_COMPONENT_CODE } from '@/page-layout/widgets/front-component/graphql/queries/getFrontComponentCode';
import { frontComponentRemoteDomComponents } from './front-component-remote-dom-components';

type FrontComponentContentProps = {
  frontComponentId: string;
};

export const FrontComponentContent = ({
  frontComponentId,
}: FrontComponentContentProps) => {
  const [hasError, setHasError] = useState(false);

  const receiver = useMemo(() => new RemoteReceiver(), []);

  const { data, loading, error } = useQuery(GET_FRONT_COMPONENT_CODE, {
    variables: { id: frontComponentId },
  });

  if (loading) {
    return <WidgetSkeletonLoader />;
  }

  const sourceCode = data?.getFrontComponentCode?.sourceCode;

  if (isDefined(error) || hasError || !isDefined(sourceCode)) {
    return <PageLayoutWidgetNoDataDisplay />;
  }

  return (
    <>
      <FrontComponentWorkerEffect
        sourceCode={sourceCode}
        receiver={receiver}
        onError={() => setHasError(true)}
      />
      <RemoteRootRenderer
        receiver={receiver}
        components={frontComponentRemoteDomComponents}
      />
    </>
  );
};
