import { useQuery } from '@apollo/client';

import { isDefined } from 'twenty-shared/utils';

import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { GET_FRONT_COMPONENT_CODE } from '@/page-layout/widgets/front-component/graphql/queries/getFrontComponentCode';
import { useState } from 'react';
import { FrontComponentContent } from 'twenty-shared/front-component';

type FrontComponentWidgetContentProps = {
  frontComponentId: string;
};

export const FrontComponentWidgetContent = ({
  frontComponentId,
}: FrontComponentWidgetContentProps) => {
  const [hasError, setHasError] = useState(false);

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
    <FrontComponentContent
      componentToRender={<div>FrontComponentContent</div>}
      setHasError={setHasError}
    />
  );
};
