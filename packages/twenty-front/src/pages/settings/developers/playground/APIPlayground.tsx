import GraphQLWrapper from '@/settings/api/playground/components/GraphQLWrapper';
import { RestApiWrapper } from '@/settings/api/playground/components/RestApiWrapper';
import { SubDoc } from '@/settings/api/playground/components/TokenForm';
import { PlaygroundTypes } from '@/settings/api/playground/form/components/ApiPlaygroundSetupForm';
import { useParams } from 'react-router-dom';

const APIPlayground = () => {
  const { schema, type } = useParams<{schema: SubDoc, type: PlaygroundTypes }>()
  
  if (type === PlaygroundTypes.GRAPH_QL) {
    return <GraphQLWrapper subDoc={schema as SubDoc} />;
  }

  return <RestApiWrapper subDoc={schema as SubDoc}/>
};

export default APIPlayground;
