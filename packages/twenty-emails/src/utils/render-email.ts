import { render } from 'react-email';

// React Email renders the tree inside its own Suspense boundary without an
// onError, so anything that throws while rendering a template is swallowed and
// the boundary ships as `<!--$!--><template></template><!--/$-->`. The email is
// then delivered with a blank body and nothing is logged (#23307). Failing the
// send is the lesser evil: a blank email is useless to the recipient and the
// thrown error surfaces in the job logs.
const ERRORED_SUSPENSE_BOUNDARY_MARKER = '<!--$!-->';

export class EmailRenderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailRenderError';
  }
}

export const renderEmail = async (
  ...renderArgs: Parameters<typeof render>
): Promise<string> => {
  const output = await render(...renderArgs);

  if (output.trim().length === 0) {
    throw new EmailRenderError('Email template rendered an empty body');
  }

  if (output.includes(ERRORED_SUSPENSE_BOUNDARY_MARKER)) {
    throw new EmailRenderError(
      'Email template threw while rendering, its body would have been empty',
    );
  }

  return output;
};
