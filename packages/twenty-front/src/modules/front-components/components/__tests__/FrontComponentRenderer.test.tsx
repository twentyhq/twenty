import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';

import { FrontComponentRenderer } from '@/front-components/components/FrontComponentRenderer';

const COMPONENT_ID = 'component';
let mockSourceComponentPath = '';
const mockLoadTokenPair = jest.fn();
const mockApplicationRenderer = jest.fn(
  (_props: { applicationAccessToken?: string }) => (
    <div>Application component</div>
  ),
);

jest.mock('@apollo/client/react', () => ({
  useQuery: () => ({
    loading: false,
    data: {
      frontComponent: {
        id: COMPONENT_ID,
        applicationId: 'workspace-app',
        name: 'Company list',
        sourceComponentPath: mockSourceComponentPath,
        builtComponentChecksum: 'checksum',
        usesSdkClient: false,
      },
    },
  }),
}));
jest.mock('twenty-front-component-renderer', () => ({
  FrontComponentRenderer: (props: { applicationAccessToken?: string }) =>
    mockApplicationRenderer(props),
}));
jest.mock('twenty-ui/components/feedback', () => ({
  useToast: () => ({ enqueueToast: jest.fn() }),
}));
jest.mock('twenty-ui/theme', () => ({
  useThemeColorScheme: () => 'light',
}));
jest.mock('@/front-components/components/AiWorkspaceFrontComponent', () => ({
  AiWorkspaceFrontComponent: () => <div>AI component</div>,
}));
jest.mock(
  '@/front-components/components/FrontComponentRendererProvider',
  () => ({
    FrontComponentRendererProvider: ({ children }: { children: ReactNode }) =>
      children,
  }),
);
jest.mock(
  '@/front-components/hooks/useFrontComponentApplicationTokenPair',
  () => ({
    useFrontComponentApplicationTokenPair: () => ({
      loadFrontComponentApplicationTokenPair: mockLoadTokenPair,
    }),
  }),
);
jest.mock('@/front-components/hooks/useOnFrontComponentUpdated', () => ({
  useOnFrontComponentUpdated: jest.fn(),
}));
jest.mock(
  '@/front-components/hooks/useOnApplicationSdkClientChecksumsUpdated',
  () => ({
    useOnApplicationSdkClientChecksumsUpdated: jest.fn(),
  }),
);
jest.mock('@/front-components/hooks/useFrontComponentExecutionContext', () => ({
  useFrontComponentExecutionContext: () => ({}),
}));
jest.mock('@/logic-functions/hooks/useGetLogicFunctionHttpUrl', () => ({
  useGetLogicFunctionHttpUrl: () => ({ functionsBaseUrl: '/functions' }),
}));
jest.mock(
  '@/front-components/media-session/hooks/useFrontComponentMediaSession',
  () => ({
    useFrontComponentMediaSession: () => ({}),
  }),
);
jest.mock(
  '@/front-components/media-session/components/FrontComponentMediaSessionRegistrationEffect',
  () => ({ FrontComponentMediaSessionRegistrationEffect: () => null }),
);
jest.mock(
  '@/front-components/media-session/components/FrontComponentMediaPermissionModal',
  () => ({ FrontComponentMediaPermissionModal: () => null }),
);

describe('component runtime routing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadTokenPair.mockResolvedValue({
      applicationAccessToken: { token: 'application-token' },
    });
  });

  it('renders an AI component without requesting application credentials', () => {
    mockSourceComponentPath = `src/ai-front-components/${COMPONENT_ID}.front-component.tsx`;

    render(<FrontComponentRenderer frontComponentId={COMPONENT_ID} />);

    expect(screen.getByText('AI component')).toBeInTheDocument();
    expect(mockLoadTokenPair).not.toHaveBeenCalled();
    expect(mockApplicationRenderer).not.toHaveBeenCalled();
  });

  it('preserves application credentials and rendering for an ordinary component', async () => {
    mockSourceComponentPath = 'src/components/companies.front-component.tsx';

    render(<FrontComponentRenderer frontComponentId={COMPONENT_ID} />);

    expect(
      await screen.findByText('Application component'),
    ).toBeInTheDocument();
    expect(mockLoadTokenPair).toHaveBeenCalledWith('workspace-app');
    expect(mockApplicationRenderer).toHaveBeenCalledWith(
      expect.objectContaining({ applicationAccessToken: 'application-token' }),
    );
    expect(screen.queryByText('AI component')).not.toBeInTheDocument();
  });
});
