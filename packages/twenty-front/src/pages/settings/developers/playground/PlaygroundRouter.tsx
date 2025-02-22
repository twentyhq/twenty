import {
  PlaygroundSchemas,
  PlaygroundTypes,
} from '@/settings/playground/components/ApiPlaygroundSetupForm';
import { GraphQLPlayground } from '@/settings/playground/components/GraphQLPlayground';
import { RestPlayground } from '@/settings/playground/components/RestPlayground';
import { useParams } from 'react-router-dom';

export const PlaygroundRouter = () => {
  const { schema, type } = useParams<{
    schema: PlaygroundSchemas;
    type: PlaygroundTypes;
  }>();

  if (type === PlaygroundTypes.GRAPH_QL.toLocaleLowerCase()) {
    return <GraphQLPlayground schema={schema as PlaygroundSchemas} />;
  }

  return <RestPlayground />;
};
