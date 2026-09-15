import { RemoteFragmentRenderer } from '@remote-dom/react/host';

import { createFallbackComponentRegistry } from '../createFallbackComponentRegistry';

const DIV_COMPONENT = (() => null) as never;
const IFRAME_COMPONENT = (() => null) as never;

const buildBaseRegistry = () =>
  new Map([
    ['html-div', DIV_COMPONENT],
    ['html-iframe', IFRAME_COMPONENT],
  ]) as Map<string, typeof DIV_COMPONENT>;

describe('createFallbackComponentRegistry', () => {
  it('should return the registered component for a known tag', () => {
    const registry = createFallbackComponentRegistry(buildBaseRegistry());

    expect(registry.get('html-div')).toBe(DIV_COMPONENT);
  });

  it('should render children only for an unknown tag', () => {
    const registry = createFallbackComponentRegistry(buildBaseRegistry());

    expect(registry.get('some-unknown-tag')).toBe(RemoteFragmentRenderer);
  });

  it('should route a raw iframe to the sandboxing html-iframe renderer instead of denying it', () => {
    const registry = createFallbackComponentRegistry(buildBaseRegistry());

    expect(registry.get('iframe')).toBe(IFRAME_COMPONENT);
  });

  it('should route a raw tag to its safe renderer regardless of casing or html- prefix', () => {
    const registry = createFallbackComponentRegistry(buildBaseRegistry());

    expect(registry.get('IFRAME')).toBe(IFRAME_COMPONENT);
    expect(registry.get('HTML-IFRAME')).toBe(IFRAME_COMPONENT);
  });

  it('should render nothing for a deny-listed tag with no safe renderer', () => {
    const registry = createFallbackComponentRegistry(buildBaseRegistry());

    const scriptComponent = registry.get('script');

    expect(scriptComponent).toBeDefined();
    expect(scriptComponent).not.toBe(RemoteFragmentRenderer);
    expect(registry.get('script')).toBe(scriptComponent);
  });

  it('should deny-list tags regardless of an html- prefix or casing', () => {
    const registry = createFallbackComponentRegistry(buildBaseRegistry());

    expect(registry.get('SCRIPT')).not.toBe(RemoteFragmentRenderer);
    expect(registry.get('html-OBJECT')).not.toBe(RemoteFragmentRenderer);
  });

  it('should remain a Map instance and not mutate the base registry', () => {
    const baseRegistry = buildBaseRegistry();
    const registry = createFallbackComponentRegistry(baseRegistry);

    expect(registry).toBeInstanceOf(Map);
    expect(baseRegistry.get('script')).toBeUndefined();
  });
});
