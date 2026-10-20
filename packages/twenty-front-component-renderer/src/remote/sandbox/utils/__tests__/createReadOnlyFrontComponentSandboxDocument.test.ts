import { FRONT_COMPONENT_SANDBOX_DOCUMENT } from '@/remote/sandbox/generated/frontComponentSandboxDocument';
import { createReadOnlyFrontComponentSandboxDocument } from '../createReadOnlyFrontComponentSandboxDocument';

describe('read-only sandbox document', () => {
  it('places the network policy before the generated bootstrap scripts', () => {
    const document = createReadOnlyFrontComponentSandboxDocument(
      FRONT_COMPONENT_SANDBOX_DOCUMENT,
    );
    const policyPosition = document.indexOf(
      '<meta http-equiv="Content-Security-Policy"',
    );

    expect(policyPosition).toBeGreaterThan(-1);
    expect(policyPosition).toBeLessThan(document.indexOf('<script'));
    expect(document).toContain("connect-src 'none'");
    expect(document).toContain("default-src 'none'");
  });

  it.each([
    '<html><head ><script>bootstrap()</script></head></html>',
    '<html><head class="changed"></head></html>',
    '<html><body>Missing head</body></html>',
  ])('rejects an unexpected document before it can run (%s)', (document) => {
    expect(() => createReadOnlyFrontComponentSandboxDocument(document)).toThrow(
      'Cannot secure',
    );
  });
});
