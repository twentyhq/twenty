import { useQuery } from '@apollo/client';

import { isDefined } from 'twenty-shared/utils';

import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { GET_FRONT_COMPONENT_CODE } from '@/page-layout/widgets/front-component/graphql/queries/getFrontComponentCode';

type FrontComponentContentProps = {
  frontComponentId: string;
};

export const FrontComponentContent = ({
  frontComponentId,
}: FrontComponentContentProps) => {
  const { data, loading, error } = useQuery(GET_FRONT_COMPONENT_CODE, {
    variables: { id: frontComponentId },
  });

  if (loading) {
    return <WidgetSkeletonLoader />;
  }

  const sourceCode = data?.getFrontComponentCode?.sourceCode;

  if (isDefined(error) || !isDefined(sourceCode)) {
    return <PageLayoutWidgetNoDataDisplay />;
  }

  // TODO: render the front component content here
  return <div>FrontComponentContent</div>;
};
