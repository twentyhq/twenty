export const getRequestOriginByHeaders = (
  context: any,
  frontHostname: string,
):
  | {
      callerType: 'internal-graphql-caller';
    }
  | {
      callerType: 'external-caller' | 'internal-caller';
      url: string;
    } => {
  if ('contextType' in context && context.contextType === 'graphql') {
    return { callerType: 'internal-graphql-caller' };
  }

  const request = context.switchToHttp().getRequest();

  const referer = new URL(request.headers.referer);

  return {
    callerType: referer.hostname.endsWith(frontHostname)
      ? 'internal-caller'
      : 'external-caller',
    url: referer.origin,
  };
};
