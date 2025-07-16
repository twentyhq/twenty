import { currentUserWorkspaceState } from "@/auth/states/currentUserWorkspaceState";
import { currentWorkspaceState } from "@/auth/states/currentWorkspaceState";
import { isTwoFactorAuthenticationEnabledState } from "@/client-config/states/isTwoFactorAuthenticationEnabledState";
import { useMemo } from "react";
import { useRecoilValue } from "recoil";

export const useTwoFactorAuthentication = () => {
    const isTwoFactorAuthenticationEnabled = useRecoilValue(isTwoFactorAuthenticationEnabledState);
    
    const currentUserWorkspace = useRecoilValue(currentUserWorkspaceState);
    const currentWorkspace = useRecoilValue(currentWorkspaceState);

    const activeMethods = useMemo(() => {
        return (currentUserWorkspace?.twoFactorAuthenticationMethodSummary ?? []).filter(
            twoFactorAuthenticationMethod => twoFactorAuthenticationMethod.isActive
        )
    },[currentUserWorkspace]);
    
    return {
        isTwoFactorAuthenticationEnabled,
        twoFactorAuthenticationStatus: activeMethods.length > 0,
        defaultTwoFactorAuthenticationMethod: activeMethods[0],
        workspaceTwoFactorAuthenticationPolicy: currentWorkspace?.twoFactorAuthenticationPolicy
    }
}