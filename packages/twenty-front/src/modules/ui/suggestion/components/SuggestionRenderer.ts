import {
  createElement,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';
import { createRoot, type Root } from 'react-dom/client';

type SuggestionRef = {
  onKeyDown?: (props: { event: KeyboardEvent }) => boolean;
} | null;

type SuggestionRendererConfig<TRendererProps, TMenuProps> = {
  component: ForwardRefExoticComponent<TMenuProps & RefAttributes<unknown>>;
  mapProps: (props: TRendererProps) => TMenuProps;
};

export class SuggestionRenderer<TRendererProps, TMenuProps> {
  componentRoot: Root | null = null;
  containerElement: HTMLElement | null = null;
  currentProps: TRendererProps | null = null;
  ref: SuggestionRef = null;

  private config: SuggestionRendererConfig<TRendererProps, TMenuProps>;

  constructor(
    config: SuggestionRendererConfig<TRendererProps, TMenuProps>,
    props: TRendererProps,
  ) {
    this.config = config;
    this.containerElement = document.createElement('div');
    document.body.appendChild(this.containerElement);

    this.componentRoot = createRoot(this.containerElement);
    this.currentProps = props;
    this.render(props);
  }

  render(props: TRendererProps): void {
    if (!this.componentRoot) {
      return;
    }

    const menuProps = this.config.mapProps(props);

    this.componentRoot.render(
      createElement(this.config.component, {
        ...menuProps,
        ref: (ref: SuggestionRef) => {
          this.ref = ref;
        },
      } as TMenuProps & RefAttributes<unknown>),
    );
  }

  updateProps(props: Partial<TRendererProps>): void {
    if (!this.componentRoot || !this.currentProps) {
      return;
    }

    const updatedProps = { ...this.currentProps, ...props };
    this.currentProps = updatedProps;
    this.render(updatedProps);
  }

  destroy(): void {
    if (this.componentRoot !== null) {
      this.componentRoot.unmount();
      this.componentRoot = null;
    }

    if (this.containerElement !== null) {
      this.containerElement.remove();
      this.containerElement = null;
    }

    this.currentProps = null;
    this.ref = null;
  }
}
