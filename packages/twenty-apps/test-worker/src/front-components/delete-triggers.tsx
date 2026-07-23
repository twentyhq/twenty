import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Command, enqueueSnackbar } from 'twenty-sdk/front-component';

const DeleteTriggers = () => {
  const execute = async () => {
    const client = new RestApiClient();

    await client.post('/s/delete-triggers', {});

    await enqueueSnackbar({
      message: 'Triggers deleted',
      variant: 'success',
    });
  };

  return <Command execute={execute} />;
};

export default defineFrontComponent({
  universalIdentifier: '04b5109c-8758-484a-a541-cae89ed2c3ea',
  name: 'delete-triggers',
  description: 'Triggers the delete-triggers logic function',
  component: DeleteTriggers,
  isHeadless: true,
});
