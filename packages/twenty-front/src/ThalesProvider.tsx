import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useRecoilState } from 'recoil';

type Props = {
    children: JSX.Element;
};

export function ThalesProvider({ children }: Props) {
    const [currentWorkspaceMember] = useRecoilState(currentWorkspaceMemberState);

    const locale = currentWorkspaceMember?.locale ?? 'en-US';
    document.documentElement.setAttribute('lang', locale.split('-')[0]);

    return <>{children}</>
};