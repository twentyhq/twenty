export default {
    "scalars": [
        0,
        1,
        3,
        4,
        6,
        15,
        25
    ],
    "types": {
        "SomeEnum": {},
        "SomeEnum2": {},
        "Query": {
            "repository": [
                7,
                {
                    "name": [
                        3,
                        "String!"
                    ],
                    "owner": [
                        3
                    ]
                }
            ],
            "optionalArgs": [
                7,
                {
                    "name": [
                        3
                    ],
                    "owner": [
                        3
                    ]
                }
            ],
            "user": [
                11
            ],
            "someScalarValue": [
                3,
                {
                    "x": [
                        4
                    ]
                }
            ],
            "recursiveType": [
                5,
                {
                    "requiredVal": [
                        3,
                        "[String!]"
                    ]
                }
            ],
            "throwsError": [
                3
            ],
            "account": [
                13
            ],
            "coordinates": [
                18
            ],
            "unionThatImplementsInterface": [
                23,
                {
                    "typename": [
                        3
                    ]
                }
            ],
            "InterfaceNotImplemented": [
                24
            ],
            "__typename": [
                3
            ]
        },
        "String": {},
        "Float": {},
        "RecursiveType": {
            "value": [
                3
            ],
            "recurse": [
                5,
                {
                    "arg": [
                        6
                    ]
                }
            ],
            "__typename": [
                3
            ]
        },
        "Int": {},
        "Repository": {
            "createdAt": [
                3
            ],
            "forks": [
                8,
                {
                    "filter": [
                        3
                    ]
                }
            ],
            "__typename": [
                3
            ]
        },
        "ForkConnection": {
            "edges": [
                9
            ],
            "__typename": [
                3
            ]
        },
        "ForkEdge": {
            "cursor": [
                3
            ],
            "node": [
                10
            ],
            "__typename": [
                3
            ]
        },
        "Fork": {
            "name": [
                3
            ],
            "number": [
                6
            ],
            "__typename": [
                3
            ]
        },
        "User": {
            "name": [
                3
            ],
            "common": [
                6
            ],
            "__typename": [
                3
            ]
        },
        "Subscription": {
            "user": [
                11
            ],
            "__typename": [
                3
            ]
        },
        "Account": {
            "on_User": [
                11
            ],
            "on_Guest": [
                14
            ],
            "__typename": [
                3
            ]
        },
        "Guest": {
            "anonymous": [
                15
            ],
            "common": [
                6
            ],
            "__typename": [
                3
            ]
        },
        "Boolean": {},
        "House": {
            "owner": [
                11
            ],
            "x": [
                3
            ],
            "y": [
                3
            ],
            "__typename": [
                3
            ]
        },
        "Bank": {
            "address": [
                3
            ],
            "x": [
                3
            ],
            "y": [
                3
            ],
            "__typename": [
                3
            ]
        },
        "Point": {
            "x": [
                3
            ],
            "y": [
                3
            ],
            "on_House": [
                16
            ],
            "on_Bank": [
                17
            ],
            "__typename": [
                3
            ]
        },
        "ClientError": {
            "message": [
                3
            ],
            "on_ClientErrorNameAlreadyTaken": [
                20
            ],
            "on_ClientErrorNameInvalid": [
                21
            ],
            "__typename": [
                3
            ]
        },
        "ClientErrorNameAlreadyTaken": {
            "message": [
                3
            ],
            "ownProp1": [
                3
            ],
            "__typename": [
                3
            ]
        },
        "ClientErrorNameInvalid": {
            "message": [
                3
            ],
            "ownProp2": [
                3
            ],
            "__typename": [
                3
            ]
        },
        "ClientErrorWithoutInterface": {
            "ownProp3": [
                3
            ],
            "__typename": [
                3
            ]
        },
        "GenericError": {
            "on_ClientErrorNameAlreadyTaken": [
                20
            ],
            "on_ClientErrorNameInvalid": [
                21
            ],
            "on_ClientErrorWithoutInterface": [
                22
            ],
            "on_ClientError": [
                19
            ],
            "__typename": [
                3
            ]
        },
        "InterfaceNotImplemented": {
            "id": [
                25
            ],
            "title": [
                3
            ],
            "url": [
                3
            ],
            "permalink": [
                3
            ],
            "entry_id": [
                25
            ],
            "__typename": [
                3
            ]
        },
        "ID": {}
    }
}