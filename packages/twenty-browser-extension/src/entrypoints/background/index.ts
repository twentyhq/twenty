import { onMessage } from "@/utils/messaging";
import { SendMessageOptions } from "@webext-core/messaging";

export default defineBackground(async () => {
    onMessage('openPopup', async () => {
        await browser.action.openPopup();
    })

    onMessage('getPersonviaRelay', async () => {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        const {firstName, lastName} = await sendMessage('extractPerson', undefined, {
            tabId: tab.id,
            frameId: 0
        } as SendMessageOptions);

        return {
            firstName,
            lastName
        }
    })

    onMessage('getCompanyviaRelay', async () => {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        const {companyName} = await sendMessage('extractCompany', undefined, {
            tabId: tab.id,
            frameId: 0
        } as SendMessageOptions);

        return {
           companyName
        }
    })
})
